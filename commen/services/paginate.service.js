const paginateService = (page, size) => {

    if (!page || page <= 0) {
        page = 1
    }

    if (!size) {
        size = 5
    }
    const skip = (page - 1) * size

    return { skip, limit: size }

}



module.exports = {paginateService}