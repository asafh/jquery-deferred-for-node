<%
options.modules.forEach(function(module) {
    print("//Unit tests for "+module+"\n");
    var filter = imports.getFilter("node", "unit",module);
    var content = filter(jquery.test.unit[module])
    print(content);
});%>