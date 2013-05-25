var jQuery = require("./jquery");
<%
options.modules.forEach(function(module) {
    print(jquery.src[module]);
    print("\n");
});
%>