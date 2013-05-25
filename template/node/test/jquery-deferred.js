<%
options.modules.forEach(function(module) {
    //TODO: apply srcFilter and unitFilter
    //TODO: Wrap them in nodeunit modules?
    print(jquery.test.unit[module]);
});%>