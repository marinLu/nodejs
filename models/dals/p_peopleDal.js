const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
var p_people = dbConnection.define('p_people', {
    peopleID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    peopleType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    credentialType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    credentialTypeCN: {
        type: Sequelize.STRING,
        allowNull: true
    },
    credentialNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    peopleName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    gender: {
        type: Sequelize.STRING,
        allowNull: true
    },
    genderCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nation: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nationCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    birthDate: {
        type: Sequelize.STRING,
        allowNull: true
    },
    origin: {
        type: Sequelize.STRING,
        allowNull: true
    },
    originCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclle: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclleCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclleRoadName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclleRoadCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclleDetailAddress: {
        type: Sequelize.STRING,
        allowNull: true
    },
    domiclleAddress: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residence: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residenceCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residenceRoadName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residenceRoadCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residenceDetailAddress: {
        type: Sequelize.STRING,
        allowNull: true
    },
    residenceAddress: {
        type: Sequelize.STRING,
        allowNull: true
    },
    education: {
        type: Sequelize.STRING,
        allowNull: false
    },
    educationCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    political: {
        type: Sequelize.STRING,
        allowNull: false
    },
    political_Code: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    maritialStatus: {
        type: Sequelize.STRING,
        allowNull: false
    },
    maritalStatusCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    spouseName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    spouseNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nationality: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nationalityCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    entryTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    surnameEng: {
        type: Sequelize.STRING,
        allowNull: true
    },
    nameEng: {
        type: Sequelize.STRING,
        allowNull: true
    },
    phoneNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    headPic: {
        type: Sequelize.STRING,
        allowNull: true
    },
    idPic: {
        type: Sequelize.STRING,
        allowNull: true
    },
    livePic: {
        type: Sequelize.STRING,
        allowNull: true
    },
    source: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    isDeleted: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
        freezeTableName: true,
        tableName: 'p_people',
        timestamps: false
    });

module.exports.insert = function (data) {
    return p_people.create({
        peopleID: data.peopleID,
        peopleType: data.peopleType,
        credentialType: data.credentialType,
        credentialTypeCN: data.credentialTypeCN,
        credentialNo: data.credentialNo,
        peopleName: data.peopleName,
        gender: data.gender,
        genderCode: data.genderCode,
        nation: data.nation,
        nationCode: data.nationCode,
        birthDate: data.birthDate,
        origin: data.origin,
        originCode: data.originCode,
        domiclle: data.domiclle,
        domiclleCode: data.domiclleCode,
        domiclleRoadName: data.domiclleRoadName,
        domiclleRoadCode: data.domiclleRoadCode,
        domiclleDetailAddress: data.domiclleDetailAddress,
        domiclleAddress: data.domiclleAddress,
        residence: data.residence,
        residenceCode: data.residenceCode,
        residenceRoadName: data.residenceRoadName,
        residenceRoadCode: data.residenceRoadCode,
        residenceDetailAddress: data.residenceDetailAddress,
        residenceAddress: data.residenceAddress,
        education: data.education,
        educationCode: data.educationCode,
        political: data.political,
        political_Code: data.political_Code,
        maritialStatus: data.maritialStatus,
        maritalStatusCode: data.maritalStatusCode,
        spouseName: data.spouseName,
        spouseNo: data.spouseNo,
        nationality: data.nationality,
        nationalityCode: data.nationalityCode,
        entryTime: data.entryTime,
        surnameEng: data.surnameEng,
        nameEng: data.nameEng,
        phoneNo: data.phoneNo,
        headPic: data.headPic,
        idPic: data.idPic,
        livePic: data.livePic,
        source: data.source,
        isDeleted: data.isDeleted,
    });
}

module.exports.getCredentialNo = function (credentialNo) {
    return p_people.findAll({
        where: {
            credentialNo: credentialNo
        }
    });
}

module.exports.getByPeopleID = function (peopleID) {
    return p_people.find({
        where: {
            peopleID: peopleID
        }
    });
}

module.exports.getByFaceID = function (faceID) {
    return p_people.find({
        where: {
            faceID: faceID
        }
    });
}

module.exports.getByPeopleIDHouse = function (peopleID, phID) {
    var sql = ``;
    var replacements = {};
    sql = `
        SELECT p_people_house.*, p_people.*,b_village.name FROM p_people_house LEFT 
        JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
        JOIN b_village on p_people_house.villageID =b_village.villageID
        WHERE p_people_house.peopleID=:peopleID and p_people_house.phID=:phID
				and p_people_house.isDelete=0 and p_people.isDeleted=0 
    `;
    replacements = {
        peopleID: peopleID,
        phID: phID
    }
    return query(sql, replacements);
}

module.exports.getByPeopleLike = function (pageNum, pageSize, villageID, peopleInfo) {
    var sql = ``;
    var replacements = {};
    var s = "%" + peopleInfo + "%"
    sql = `
        SELECT p_people_house.*, p_people.*,b_village.name FROM p_people_house LEFT 
        JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
        JOIN b_village on p_people_house.villageID =b_village.villageID
        WHERE p_people_house.villageID in (:villageID)
        and (p_people_house.houseNo like :s or p_people.peopleName like :s  or  p_people.phoneNo like :s)
        and p_people_house.isDelete=0 and p_people.isDeleted=0  order by p_people_house.insertTime desc limit :startIndex,:pageSize 
    `;
    replacements = {
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize,
        villageID: villageID,
        s: s
    }
    return query(sql, replacements);
}

module.exports.getPeopleAdvancedLike = function (pageNum, pageSize, villageID, peopleName, genderCode,
    credentialNo, phoneNo, nation, insertTime, houseNo, buildingID, resideMode, isChildren, isAged, isFocus, isCare, isHouse) {

    var replacements = {};
    var sqlParam = ``;
    let peopleNames = "%" + peopleName + "%";
    let credentialNos = "%" + credentialNo + "%";
    let phoneNos = "%" + phoneNo + "%";
    let nations = "%" + nation + "%";
    let houseNos = "%" + houseNo + "%";
    let buildingIDs = "%" + buildingID + "%";
    var sqlt = `
    SELECT p_people_house.*, p_people.*,b_village.name FROM p_people_house LEFT 
    JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
    JOIN b_village on p_people_house.villageID =b_village.villageID
    WHERE p_people_house.villageID=:villageID `;
    var sqlw = `and p_people_house.isDelete=0 and p_people.isDeleted=0  
    order by p_people_house.insertTime desc limit :startIndex,:pageSize `;
    if (peopleName.length > 0) {
        sqlParam += `and p_people.peopleName like :peopleNames `;
    }
    if (genderCode >= 0) {
        sqlParam += `and p_people.genderCode =:genderCode `;
    }
    if (credentialNo.length > 0) {
        sqlParam += `and p_people.credentialNo like :credentialNos `;
    }
    if (phoneNo.length > 0) {
        sqlParam += `and p_people.phoneNo like :phoneNos `;
    }
    if (nation.length > 0) {
        sqlParam += `and p_people.nation like :nations `;
    }
    if (insertTime.length > 0) {
        sqlParam += `and p_people.insertTime >= :insertTime and p_people.insertTime<= date_add(:insertTime, interval 1 day)`;
    }
    if (houseNo.length > 0) {
        sqlParam += `and p_people_house.houseNo like :houseNos `;
    }
    if (buildingID.length > 0) {
        sqlParam += `and p_people_house.buildingID like :buildingIDs `;
    }
    if (resideMode >= 0) {
        sqlParam += `and p_people_house.resideMode = :resideMode `;
    }
    if (isChildren >= 0) {
        sqlParam += `and p_people_house.isChildren = :isChildren `;
    }
    if (isAged >= 0) {
        sqlParam += `and p_people_house.isAged = :isAged `;
    }
    if (isFocus >= 0) {
        sqlParam += `and p_people_house.isFocus = :isFocus `;
    }
    if (isCare >= 0) {
        sqlParam += `and p_people_house.isCare = :isCare `;
    }
    if (isHouse >= 0) {
        sqlParam += `and p_people_house.isHouse = :isHouse `;
    }
    replacements = {
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize,
        villageID: villageID,
        peopleNames: peopleNames,
        genderCode: genderCode,
        credentialNos: credentialNos,
        phoneNos: phoneNos,
        nations: nations,
        insertTime, insertTime,
        houseNos, houseNos,
        buildingIDs: buildingIDs,
        resideMode: resideMode,
        isChildren: isChildren,
        isAged: isAged,
        isFocus: isFocus,
        isHouse: isHouse,
        isCare: isCare
    }
    var sql = sqlt + sqlParam + sqlw;
    return query(sql, replacements);
}

module.exports.getPeopleAdvancedLikeCount = async function (villageID, peopleName, genderCode,
    credentialNo, phoneNo, nation, insertTime, houseNo, buildingID, resideMode, isChildren, isAged, isFocus, isCare, isHouse) {

    var replacements = {};
    var sqlParam = ``;
    let peopleNames = "%" + peopleName + "%";
    let credentialNos = "%" + credentialNo + "%";
    let phoneNos = "%" + phoneNo + "%";
    let nations = "%" + nation + "%";
    let houseNos = "%" + houseNo + "%";
    let buildingIDs = "%" + buildingID + "%";
    var sqlt = `
    SELECT count(*) as count FROM p_people_house LEFT 
    JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
    JOIN b_village on p_people_house.villageID =b_village.villageID
    WHERE p_people_house.villageID=:villageID  `;
    var sqlw = `and p_people_house.isDelete=0 and p_people.isDeleted=0`;
    if (peopleName.length > 0) {
        sqlParam += `and p_people.peopleName like :peopleNames `;
    }
    if (genderCode >= 0) {
        sqlParam += `and p_people.genderCode =:genderCode `;
    }
    if (credentialNo.length > 0) {
        sqlParam += `and p_people.credentialNo like :credentialNos `;
    }
    if (phoneNo.length > 0) {
        sqlParam += `and p_people.phoneNo like :phoneNos `;
    }
    if (nations.length > 0) {
        sqlParam += `and p_people.nation like :nations `;
    }
    if (insertTime.length > 0) {
        sqlParam += `and p_people.insertTime >= :insertTime and p_people.insertTime<= date_add(:insertTime, interval 1 day)`;
    }
    if (houseNo.length > 0) {
        sqlParam += `and p_people_house.houseNo like :houseNos `;
    }
    if (buildingID.length > 0) {
        sqlParam += `and p_people_house.buildingID like :buildingIDs `;
    }
    if (resideMode >= 0) {
        sqlParam += `and p_people_house.resideMode = :resideMode `;
    }
    if (isChildren >= 0) {
        sqlParam += `and p_people_house.isChildren = :isChildren `;
    }
    if (isAged >= 0) {
        sqlParam += `and p_people_house.isAged = :isAged `;
    }
    if (isFocus >= 0) {
        sqlParam += `and p_people_house.isFocus = :isFocus `;
    }
    if (isCare >= 0) {
        sqlParam += `and p_people_house.isCare = :isCare `;
    }
    if (isHouse >= 0) {
        sqlParam += `and p_people_house.isHouse = :isHouse `;
    }
    replacements = {
        villageID: villageID,
        peopleNames: peopleNames,
        genderCode: genderCode,
        credentialNos: credentialNos,
        phoneNos: phoneNos,
        nations: nations,
        insertTime, insertTime,
        houseNos, houseNos,
        buildingIDs: buildingIDs,
        resideMode: resideMode,
        isChildren: isChildren,
        isAged: isAged,
        isFocus: isFocus,
        isHouse: isHouse,
        isCare: isCare
    }
    var sql = sqlt + sqlParam + sqlw;
    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.getByPeopleLikeCount = async function (villageID, peopleInfo) {
    var sql = ``;
    var replacements = {};
    var s = "%" + peopleInfo + "%"
    sql = `
            SELECT count(*) as count FROM p_people_house LEFT 
            JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
            JOIN b_village on p_people_house.villageID =b_village.villageID
            WHERE p_people_house.villageID in (:villageID)
            and (p_people_house.houseNo like :s or p_people.peopleName like :s or  p_people.phoneNo like :s)
            and p_people_house.isDelete=0 and p_people.isDeleted=0  
        `;
    replacements = {
        villageID: villageID,
        s: s

    }
    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.getByPeopleIDs = function (peopleIDs) {
    return p_people.findAll({
        where: {
            peopleID: {
                [Op.in]: peopleIDs
            }
        }
    });
}

module.exports.getHouseUserByVillageID = function (pageNum, pageSize, villageIDs) {//根据小区获取所有的住户信息
    var sql = ``;
    var replacements = {};
    sql = `
        SELECT p_people_house.*, p_people.*,b_village.name as villageName,b_building.name as buildingName  FROM p_people_house
        LEFT JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
        LEFT JOIN b_village on p_people_house.villageID =b_village.villageID
        LEFT JOIN b_building on p_people_house.buildingID =b_building.buildingID
        WHERE p_people_house.villageID in (:villageIDs)
				and p_people_house.isDelete=0 and p_people.isDeleted=0
        order by p_people_house.insertTime desc limit :startIndex,:pageSize 
    `;
    replacements = {
        villageIDs: villageIDs,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}
module.exports.getByBuildingIDHouseNos = function (buildingID, houseNos) {
    var sql = ' SELECT * FROM p_people ' +
        ' inner join ' +
        ' p_people_house ' +
        ' on p_people.peopleID=p_people_house.peopleID ' +
        ' where p_people_house.buildingID=:buildingID ';

    var where = {
        buildingID: buildingID
    }

    if (houseNos != null && houseNos.length > 0) {
        sql += ' and  p_people_house.houseNo in(:houseNos)';
        where.houseNos = houseNos;
    }

    return query(sql, where);
}

module.exports.getByCredentialNosType = function (credentialNos, credentialType) {
    return p_people.findAll({
        where: {
            credentialNo: {
                [Op.in]: credentialNos
            },
            credentialType: credentialType
        }
    });
}

module.exports.update = function (data) {
    return p_people.update({
        peopleID: data.peopleID,
        peopleType: data.peopleType,
        credentialType: data.credentialType,
        credentialTypeCN: data.credentialTypeCN,
        credentialNo: data.credentialNo,
        peopleName: data.peopleName,
        gender: data.gender,
        genderCode: data.genderCode,
        nation: data.nation,
        nationCode: data.nationCode,
        birthDate: data.birthDate,
        origin: data.origin,
        originCode: data.originCode,
        domiclle: data.domiclle,
        domiclleCode: data.domiclleCode,
        domiclleRoadName: data.domiclleRoadName,
        domiclleRoadCode: data.domiclleRoadCode,
        domiclleDetailAddress: data.domiclleDetailAddress,
        domiclleAddress: data.domiclleAddress,
        residence: data.residence,
        residenceCode: data.residenceCode,
        residenceRoadName: data.residenceRoadName,
        residenceRoadCode: data.residenceRoadCode,
        residenceDetailAddress: data.residenceDetailAddress,
        residenceAddress: data.residenceAddress,
        education: data.education,
        educationCode: data.educationCode,
        political: data.political,
        political_Code: data.political_Code,
        maritialStatus: data.maritialStatus,
        maritalStatusCode: data.maritalStatusCode,
        spouseName: data.spouseName,
        spouseNo: data.spouseNo,
        nationality: data.nationality,
        nationalityCode: data.nationalityCode,
        entryTime: data.entryTime,
        surnameEng: data.surnameEng,
        nameEng: data.nameEng,
        phoneNo: data.phoneNo,
        headPic: data.headPic,
        idPic: data.idPic,
        livePic: data.livePic,
        source: data.source,
        isDeleted: data.isDeleted,
    }, {
            where: {
                peopleID: data.peopleID
            }
        });
}

module.exports.updateInfo = function (data) {
    return p_people.update({
        peopleType: data.peopleType,
        credentialType: data.credentialType,
        credentialTypeCN: data.credentialTypeCN,
        credentialNo: data.credentialNo,
        peopleName: data.peopleName,
        gender: data.gender,
        genderCode: data.genderCode,
        nation: data.nation,
        nationCode: data.nationCode,
        birthDate: data.birthDate,
        origin: data.origin,
        originCode: data.originCode,
        domiclle: data.domiclle,
        domiclleCode: data.domiclleCode,
        domiclleRoadName: data.domiclleRoadName,
        domiclleRoadCode: data.domiclleRoadCode,
        domiclleDetailAddress: data.domiclleDetailAddress,
        domiclleAddress: data.domiclleAddress,
        residence: data.residence,
        residenceCode: data.residenceCode,
        residenceRoadName: data.residenceRoadName,
        residenceRoadCode: data.residenceRoadCode,
        residenceDetailAddress: data.residenceDetailAddress,
        residenceAddress: data.residenceAddress,
        education: data.education,
        educationCode: data.educationCode,
        political: data.political,
        political_Code: data.political_Code,
        maritialStatus: data.maritialStatus,
        maritalStatusCode: data.maritalStatusCode,
        spouseName: data.spouseName,
        spouseNo: data.spouseNo,
        nationality: data.nationality,
        nationalityCode: data.nationalityCode,
        entryTime: data.entryTime,
        surnameEng: data.surnameEng,
        nameEng: data.nameEng,
        phoneNo: data.phoneNo,
        headPic: data.headPic,
        idPic: data.idPic,
        livePic: data.livePic,
        source: data.source,
    }, {
            where: {
                peopleID: data.peopleID
            }
        });
}

module.exports.updateIsdel = function (data) {
    return p_people.update({
        isDeleted: data.isDeleted,
    }, {
            where: {
                peopleID: data.peopleID
            }
        });
}

module.exports.delete = function (peopleID) {
    return p_people.destroy({
        where: {
            peopleID: peopleID
        }
    });
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.query = query;