const { validationResult } = require("express-validator")

const handelValidation = () => {
    return (req, res, next) => {
        try {
            const validationError = validationResult(req)

            if (validationError.isEmpty()) {
                next()
            } else {
                res.status(400).json({ message: "validation err", error: validationError.errors })
            }


        } catch (error) {
            res.status(500).json({ message: "server error" , error})

        }

    }
}


module.exports = handelValidation