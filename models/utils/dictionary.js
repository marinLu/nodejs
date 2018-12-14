
module.exports =function(arrs,name){
    if(arrs==null||arrs.length==0){
        return '';
    }

    var typeNames= arrs.filter(x=>x.name==name);
    if (typeNames==null||typeNames.length==0) {
        return '';
    }

    return typeNames[0].typeName;
}