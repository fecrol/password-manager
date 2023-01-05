const getDate = () => {
    const date = new Date()
    const day = date.getDay() < 10 ? `0${date.getDay()}` : date.getDay()
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
}

module.exports = getDate
