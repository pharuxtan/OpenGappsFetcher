setInterval(async function() {
  const fetch = require("node-fetch"), fs = require("fs");
  let platform = Object.keys(JSON.parse((await fetch("https://sourceforge.net/projects/opengapps/files/").then(res => res.text())).split("net.sf.files = ")[1].split(";")[0])).filter(n => n !== "README.md");
  let gapps = {};
  for(var a=0; a<platform.length; a++){
    gapps[platform[a]] = {};
    let date = Object.keys(JSON.parse((await fetch(`https://sourceforge.net/projects/opengapps/files/${platform[a]}`).then(res => res.text())).split("net.sf.files = ")[1].split(";")[0])).filter(n => n !== "stable" && n !== "test" && n !== "beta").slice(-1)[0];
    let filessf = JSON.parse((await fetch(`https://sourceforge.net/projects/opengapps/files/${platform[a]}/${date}`).then(res => res.text())).split("net.sf.files = ")[1].split(";")[0]);
    let files = Object.keys(filessf).filter(n => n.endsWith(".zip")).sort((a,b) => parseFloat(b.split("-")[2]) - parseFloat(a.split("-")[2]));
    for(var f=0; f<files.length; f++){
      let file = files[f];
      let ver = file.split("-")[2];
      let variant = file.split("-")[3];
      file = filessf[file];
      if(gapps[platform[a]][ver] == undefined) gapps[platform[a]][ver] = {variant: [],downloads: {},state: []};
      gapps[platform[a]][ver]["variant"].push(variant);
      if(!gapps[platform[a]][ver]["state"].includes("stable")) gapps[platform[a]][ver]["state"].push("stable");
      let head = await fetch((await handleSF(file.download_url))[0], {method: "HEAD"});
      gapps[platform[a]][ver]["downloads"][variant] = {
        name: file.name,
        date: date,
        size: parseInt(head.headers.get("content-length")),
        md5: file.md5,
        sha1: file.sha1,
        state: "stable",
        download: `https://downloads.sourceforge.net/project/opengapps/${platform[a]}/${date}/${file.name}?r=&ts={time}&use_mirror=autoselect`
      }
      if(filessf[file.name + ".md5"] !== undefined){
        gapps[platform[a]][ver]["downloads"][variant]["md5file"] = {
          name: file.name + ".md5",
          download: `https://downloads.sourceforge.net/project/opengapps/${platform[a]}/${date}/${file.name + ".md5"}?r=&ts={time}&use_mirror=autoselect`
        }
      }
    }
  }
  fs.writeFileSync("./gapps.json", JSON.stringify(gapps, null, 2), "utf8");
  async function handleSF(link) {
    return new Promise((resolve, reject) => {
      let links = [];
      var matches;

      const request = require("request"), JSDOM = require("jsdom");

      matches = link.match(/\bhttps?:\/\/\S+/gi);

      var filteredPath = matches[0].replace("https://download.sourceforge.net", "");
      filteredPath = filteredPath.replace("https://downloads.sourceforge.net", "");
      filteredPath = filteredPath.replace("/files", "");
      filteredPath = filteredPath.replace("/projects/", "");
      filteredPath = filteredPath.replace("/project/", "");
      filteredPath = filteredPath.replace("https://sourceforge.net", "");
      filteredPath = filteredPath.replace("/download", "");

      var projectname = matches[0].split("/")[4];

      filteredPath = filteredPath.replace(projectname, "");

      var mirrorsUrl = "https://sourceforge.net/settings/mirror_choices?projectname=" + projectname + "&filename=" + filteredPath;

      request.get(mirrorsUrl, function (error, response, body) {
        var dom = new JSDOM.JSDOM(body);
        var mirrors = dom.window.document.querySelectorAll("#mirrorList li");
        for (var i = 0; i < mirrors.length; i++) {
          if (i % 2) {
            var mirrorName = mirrors[i].id;
            links.push("https://" + mirrorName + ".dl.sourceforge.net/project/" + projectname + filteredPath);
          }
        }
        resolve(links);
      });
    });
  }
}, 43200000)
