module.exports = class e_face_logEntity {
    constructor(faceLogID, faceID, credentialNo,
        credentialType, faceCapture, snapUUid,
        faceCaptureTime, ageRange, glass, sex,
        faceRect, faceUrl, bkgUrl, isRegistered,
        mageLock, imageRemoved, insertTime, updateTime,
        personType, faceSimilarity) {
        this.faceLogID = faceLogID;
        this.faceID = faceID;
        this.credentialNo = credentialNo;
        this.credentialType = credentialType;
        this.faceCapture = faceCapture;
        this.snapUUid = snapUUid;
        this.faceCaptureTime = faceCaptureTime;
        this.ageRange = ageRange;
        this.glass = glass;
        this.sex = sex;
        this.faceRect = faceRect;
        this.faceUrl = faceUrl;
        this.bkgUrl = bkgUrl;
        this.isRegistered = isRegistered;
        this.mageLock = mageLock;
        this.imageRemoved = imageRemoved;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
        this.personType = personType;
        this.faceSimilarity = faceSimilarity;
    }
}