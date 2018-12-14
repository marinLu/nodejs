function changeDateFullFormat(datetimes){
    var date = new Date(datetimes);
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())  + ' ';
    h = (date.getHours()< 10 ? '0'+date.getHours():date.getHours()) + ':';
    m = (date.getMinutes()< 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
    s =  (date.getSeconds()< 10 ? '0'+date.getSeconds():date.getSeconds()); 
    //年 月 日 时 分 秒
    return Y+M+D + h + m + s;
}
module.exports.changeDateFullFormat = changeDateFullFormat;



function GetDate(datetimes){
    var date = new Date(datetimes);
    Y = date.getFullYear() + '';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '';
    D = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
   
    //年 月 日
    return Y+M+D;
}
module.exports.getDate=GetDate;