const { Op } = require('sequelize');
const { User, AssignComplaints, UserComplaint, Status, ComplaintStatus } = require('../models/index');
const httpstatus = require('../utils/httpstatus');
const { sendStatusUpdateEmail, sendComplaintConfirmEmail } = require('../utils/mailer');
require('dotenv').config();

// ── helpers ──────────────────────────────────────────────────────────────────
const buildComplaintObj = (complaintData, complaintstatus, statusType) => ({
  complaint_id: complaintData.complaint_id,
  name: complaintData.name,
  email: complaintData.email,
  mobile: complaintData.mobile,
  address: complaintData.address,
  user_type: complaintData.user_type,
  complaint_type: complaintData.complaint_type,
  complaintDetails: complaintData.complaintDetails,
  image_proof: complaintData.image_proof || null,
  status_id: complaintstatus.status_id,
  status_type: statusType.status_name,
  is_active: complaintData.is_active,
  createdAt: complaintData.createdAt,
});

// ── create complaint ──────────────────────────────────────────────────────────
exports.UserComplaintsCreate = async (req, res) => {
  const defaultStatus = 'process';
  try {
    const { name, email, mobile, address, user_type, complaint_type, complaintDetails } = req.body;
    const image_proof = req.file ? req.file.filename : null;

    const newComplaint = await UserComplaint.create({
      name, email, mobile, address, user_type, complaint_type, complaintDetails, image_proof,
    });
    if (!newComplaint) return res.status(500).send(httpstatus.errorResponse({ error_code: 1, message: 'Failed to create complaint' }));

    const complaint_id = newComplaint.complaint_id;
    const status = await Status.findOne({ where: { status_name: defaultStatus }, raw: true });
    if (!status?.status_id) throw new Error('Failed to fetch status');

    await ComplaintStatus.create({ complaint_id, status_id: status.status_id, is_active: 1 });

    // send confirmation email (non-blocking)
    sendComplaintConfirmEmail({ to: email, name, trackingId: complaint_id });

    return res.status(201).send(httpstatus.successResponse({ error_code: 0, message: 'Complaint created successfully', trackingId: complaint_id }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── list complaints ───────────────────────────────────────────────────────────
exports.listComplaint = async (req, res) => {
  try {
    const { user_type, user_id } = req.body;
    if (user_type !== 'superadmin' && user_type !== 'subadmin')
      return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    let complaintList;
    if (user_type === 'subadmin') {
      const assigned = await AssignComplaints.findAll({ where: { user_id, is_active: 1 }, raw: true });
      const ids = assigned.map(a => a.complaint_id);
      complaintList = await UserComplaint.findAll({ where: { complaint_id: ids, is_active: 1 }, raw: true });
    } else {
      complaintList = await UserComplaint.findAll({ where: { is_active: 1 }, raw: true });
    }

    const complaintArr = [];
    for (const c of complaintList) {
      try {
        const cs = await ComplaintStatus.findOne({ where: { complaint_id: c.complaint_id, is_active: 1 }, raw: true });
        if (!cs) continue;
        const st = await Status.findOne({ where: { status_id: cs.status_id, is_active: 1 }, raw: true });
        complaintArr.push(buildComplaintObj(c, cs, st));
      } catch {}
    }

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, complaintList: complaintArr, message: 'Fetched successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── dashboard stats ───────────────────────────────────────────────────────────
exports.dashboardStats = async (req, res) => {
  try {
    const { user_type, user_id } = req.body;
    if (user_type !== 'superadmin' && user_type !== 'subadmin')
      return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    let complaintList;
    if (user_type === 'subadmin') {
      const assigned = await AssignComplaints.findAll({ where: { user_id, is_active: 1 }, raw: true });
      const ids = assigned.map(a => a.complaint_id);
      complaintList = await UserComplaint.findAll({ where: { complaint_id: ids, is_active: 1 }, raw: true });
    } else {
      complaintList = await UserComplaint.findAll({ where: { is_active: 1 }, raw: true });
    }

    const stats = { total: 0, process: 0, resolved: 0, closed: 0 };
    for (const c of complaintList) {
      const cs = await ComplaintStatus.findOne({ where: { complaint_id: c.complaint_id, is_active: 1 }, raw: true });
      if (!cs) continue;
      const st = await Status.findOne({ where: { status_id: cs.status_id }, raw: true });
      stats.total++;
      if (st?.status_name === 'process') stats.process++;
      else if (st?.status_name === 'resolved') stats.resolved++;
      else if (st?.status_name === 'closed') stats.closed++;
    }

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, stats, message: 'Stats fetched' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── complaint detail ──────────────────────────────────────────────────────────
exports.complaintDetails = async (req, res) => {
  try {
    const { complaint_id, user_type } = req.body;
    if (user_type !== 'superadmin' && user_type !== 'subadmin')
      return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    const c = await UserComplaint.findOne({ where: { complaint_id, is_active: 1 }, raw: true });
    if (!c) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Complaint not found' }));

    const cs = await ComplaintStatus.findOne({ where: { complaint_id, is_active: 1 }, raw: true });
    if (!cs) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Status not found' }));

    const st = await Status.findOne({ where: { status_id: cs.status_id, is_active: 1 }, raw: true });

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, complaintDetail: buildComplaintObj(c, cs, st), message: 'Fetched successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── track complaint (public) ──────────────────────────────────────────────────
exports.complaintTracking = async (req, res) => {
  try {
    const { complaint_id } = req.body;
    const c = await UserComplaint.findOne({ where: { complaint_id, is_active: 1 }, raw: true });
    if (!c) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Complaint not found' }));

    const cs = await ComplaintStatus.findOne({ where: { complaint_id, is_active: 1 }, raw: true });
    if (!cs) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Status not found' }));

    const st = await Status.findOne({ where: { status_id: cs.status_id, is_active: 1 }, raw: true });

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, complaintDetail: buildComplaintObj(c, cs, st), message: 'Fetched successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── status change ─────────────────────────────────────────────────────────────
exports.statusChange = async (req, res) => {
  try {
    const { status_id, complaint_id } = req.body;
    const found = await ComplaintStatus.findOne({ where: { complaint_id }, raw: true });
    if (!found) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Complaint not found' }));

    const [updated] = await ComplaintStatus.update({ status_id }, { where: { complaint_id } });
    if (!updated) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Status unchanged' }));

    // send email notification (non-blocking)
    const c = await UserComplaint.findOne({ where: { complaint_id }, raw: true });
    const st = await Status.findOne({ where: { status_id }, raw: true });
    if (c && st) sendStatusUpdateEmail({ to: c.email, name: c.name, trackingId: complaint_id, status: st.status_name });

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, message: 'Status changed successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── update complaint ──────────────────────────────────────────────────────────
exports.updateComplaint = async (req, res) => {
  try {
    const { complaint_id, user_type, name, email, mobile, address, complaint_type, complaintDetails } = req.body;
    if (user_type !== 'superadmin') return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    const [updated] = await UserComplaint.update(
      { name, email, mobile, address, complaint_type, complaintDetails },
      { where: { complaint_id, is_active: 1 } }
    );
    if (!updated) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Complaint not found' }));

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, message: 'Complaint updated successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── delete complaint (soft) ───────────────────────────────────────────────────
exports.deleteComplaint = async (req, res) => {
  try {
    const { complaint_id, user_type } = req.body;
    if (user_type !== 'superadmin') return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    const [updated] = await UserComplaint.update({ is_active: 0 }, { where: { complaint_id } });
    if (!updated) return res.status(404).send(httpstatus.errorResponse({ error_code: 1, message: 'Complaint not found' }));

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, message: 'Complaint deleted successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── assign complaint ──────────────────────────────────────────────────────────
exports.AssignComplaints = async (req, res) => {
  try {
    const { complaint_id, user_id, user_type } = req.body;
    if (user_type !== 'superadmin') return res.status(403).json({ error_code: 1, message: 'Not authorized' });

    const existing = await AssignComplaints.findOne({ where: { complaint_id, user_id }, raw: true });
    if (existing) return res.status(400).json({ error_code: 1, message: 'Already assigned to this user' });

    const result = await AssignComplaints.create({ complaint_id, user_id });
    return res.status(200).json({ error_code: 0, message: 'Assigned successfully', data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 1, message: 'Internal Server Error', error: error.message });
  }
};

// ── export complaints as CSV data ─────────────────────────────────────────────
exports.exportComplaints = async (req, res) => {
  try {
    const { user_type, user_id } = req.body;
    if (user_type !== 'superadmin' && user_type !== 'subadmin')
      return res.status(403).send(httpstatus.errorResponse({ error_code: 1, message: 'Not authorized' }));

    let complaintList;
    if (user_type === 'subadmin') {
      const assigned = await AssignComplaints.findAll({ where: { user_id, is_active: 1 }, raw: true });
      const ids = assigned.map(a => a.complaint_id);
      complaintList = await UserComplaint.findAll({ where: { complaint_id: ids, is_active: 1 }, raw: true });
    } else {
      complaintList = await UserComplaint.findAll({ where: { is_active: 1 }, raw: true });
    }

    const rows = [];
    for (const c of complaintList) {
      const cs = await ComplaintStatus.findOne({ where: { complaint_id: c.complaint_id, is_active: 1 }, raw: true });
      const st = cs ? await Status.findOne({ where: { status_id: cs.status_id }, raw: true }) : null;
      rows.push({
        complaint_id: c.complaint_id,
        name: c.name,
        email: c.email,
        mobile: c.mobile,
        address: c.address,
        complaint_type: c.complaint_type,
        complaintDetails: c.complaintDetails,
        status: st?.status_name || 'unknown',
        createdAt: c.createdAt,
      });
    }

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, exportData: rows, message: 'Export data ready' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ── complaint history by email/mobile (public) ────────────────────────────────
exports.complaintHistory = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    if (!email && !mobile) return res.status(400).send(httpstatus.errorResponse({ error_code: 1, message: 'Email or mobile required' }));

    const where = { is_active: 1 };
    if (email) where.email = email;
    else where.mobile = mobile;

    const complaints = await UserComplaint.findAll({ where, raw: true });
    const result = [];
    for (const c of complaints) {
      const cs = await ComplaintStatus.findOne({ where: { complaint_id: c.complaint_id, is_active: 1 }, raw: true });
      const st = cs ? await Status.findOne({ where: { status_id: cs.status_id }, raw: true }) : null;
      result.push(buildComplaintObj(c, cs || { status_id: 1 }, st || { status_name: 'process' }));
    }

    return res.status(200).send(httpstatus.successResponse({ error_code: 0, complaints: result, message: 'History fetched' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
