class httpstatus{
    successResponse(data) {
        return JSON.stringify({                        
            "code": "200",
            "status": "success",
            "data": data
        });
    }
    errorResponse(data) {
        return JSON.stringify({                        
            "code": "500",
            "status": "failure",
            "data": data
        });
    }

}
module.exports = new httpstatus();