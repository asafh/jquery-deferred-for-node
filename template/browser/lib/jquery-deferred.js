<%
options.modules.forEach(function(module) {
//    print("///////////////////"+module+"\n")
    var filter = imports.getFilter("browser", "src",module);
    var source = jquery.src[module];
    //Case of sylar reading json files..
    source = typeof source !== "string" ? JSON.stringify(source) : source

    var content = filter(source)
    print(content);
    print("\n");
});
%>