<%
options.modules.forEach(function(module) {
    var filter = imports.getFilter("unit",module);
    var content = filter(jquery.test.unit[module])
    print(content);
});%>