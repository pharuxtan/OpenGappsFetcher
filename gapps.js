setInterval(async function() {
  const fetch = require('node-fetch');
  const HTMLParser = require('node-html-parser');
  const fs = require('fs');
  let gapps = {};
  let arch = await fetch(`https://sourceforge.net/projects/opengapps/files/`).then(res => res.text());
  let archroot = HTMLParser.parse(arch);
  let archs = archroot.querySelector('#files_list').childNodes[11].childNodes.filter(n => n.nodeType !== 3).map(n => n.rawAttrs.split('"')[1]);
  for (let a = 0; a < archs.length; a++) {
    let ar = a;
    gapps[archs[ar]] = {};
    let date = await fetch(`https://sourceforge.net/projects/opengapps/files/${archs[ar]}/`).then(res => res.text());
    let dateroot = HTMLParser.parse(date);
    let dates = dateroot.querySelector('#files_list').childNodes[11].childNodes.filter(n => n.nodeType !== 3);
    let time;
    for (var i = 0; i < dates.length; i++) {
      let test = `${dates[i].rawAttrs}`.split('"')[1];
      if (test === "beta") {
        let dates = await fetch(`https://sourceforge.net/projects/opengapps/files/${archs[ar]}/beta/`).then(res => res.text());
        let daterootd = HTMLParser.parse(dates);
        let timed = daterootd.querySelector('#files_list').childNodes[11].childNodes.filter(n => n.nodeType !== 3)[0].rawAttrs.split('"')[1];
        let file = await fetch(`https://sourceforge.net/projects/opengapps/files/${archs[ar]}/beta/${timed}/`).then(res => res.text());
        let fileroot = HTMLParser.parse(file);
        let files = fileroot.querySelector('#files_list').childNodes[11].childNodes.filter(n => n.nodeType !== 3).map(n => n.rawAttrs.split('"')[1]);
        let infos = JSON.parse(file.split("net.sf.files = ")[1].split(";")[0]);
        for (var f = 0; f < files.length; f++) {
          let sel = files[f];
          if (sel !== undefined && sel.indexOf(".txt") === -1 && sel.indexOf(".md5") === -1) {
            let version = sel.split("-")[2];
            let variant = sel.split("-")[3];
            let info = infos[sel];
            if (gapps[archs[ar]][version] === undefined) {
              gapps[archs[ar]][version] = {"variant": [],"downloads":{},"beta": true};
            }
            if (!gapps[archs[ar]][version]["variant"].includes(variant)) {
              gapps[archs[ar]][version]["variant"].push(variant);
              let gfile = fileroot.querySelector('#files_list').childNodes[11].childNodes.find(n => n.rawAttrs === `title="${sel}" class="file "`).childNodes;
              let download;
              if(infos[`${sel}.md5`] !== undefined){
                download = {
                  "name": sel,
                  "date": Math.floor(new Date(gfile.find(n => n.rawAttrs === 'headers="files_date_h" class="opt"').childNodes[0].rawAttrs.split('"')[1]).getTime()/1000),
                  "filedate": timed,
                  "size": gfile.find(n => n.rawAttrs === `headers="files_size_h" class="opt"`).childNodes[0].rawText.replace(/\s/g, ""),
                  "md5file": {
                    "name": `${sel}.md5`,
                    "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/beta/${timed}/${sel}.md5?r=&ts={time}&use_mirror=autoselect`
                  },
                  "md5": info.md5,
                  "sha1": info.sha1,
                  "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/beta/${timed}/${sel}?r=&ts={time}&use_mirror=autoselect`
                }
              } else {
                download = {
                  "name": sel,
                  "date": Math.floor(new Date(gfile.find(n => n.rawAttrs === 'headers="files_date_h" class="opt"').childNodes[0].rawAttrs.split('"')[1]).getTime()/1000),
                  "filedate": timed,
                  "size": gfile.find(n => n.rawAttrs === `headers="files_size_h" class="opt"`).childNodes[0].rawText.replace(/\s/g, ""),
                  "md5": info.md5,
                  "sha1": info.sha1,
                  "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/beta/${timed}/${sel}?r=&ts={time}&use_mirror=autoselect`
                }
              }
              gapps[archs[ar]][version]["downloads"][variant] = download;
            }
          }
        }
      }
    }
    for (var i = 0; i < dates.length; i++) {
      let test = `${dates[i].rawAttrs}`.split('"')[1];
      if (test !== "test" && test !== "beta" && test !== undefined) {
        time = test;
        i = dates.length;
      }
    }
    let file = await fetch(`https://sourceforge.net/projects/opengapps/files/${archs[ar]}/${time}/`).then(res => res.text())
    let fileroot = HTMLParser.parse(file);
    let files = fileroot.querySelector('#files_list').childNodes[11].childNodes.filter(n => n.nodeType !== 3).map(n => n.rawAttrs.split('"')[1]);
    let infos = JSON.parse(file.split("net.sf.files = ")[1].split(";")[0]);
    for (var f = 0; f < files.length; f++) {
      let sel = files[f];
      if (sel !== undefined && sel.indexOf(".txt") === -1 && sel.indexOf(".md5") === -1) {
        let version = sel.split("-")[2]
        let variant = sel.split("-")[3]
        let info = infos[sel];
        if (gapps[archs[ar]][version] === undefined) {
          gapps[archs[ar]][version] = {"variant": [],"downloads":{},"beta": false};
        } else if(gapps[archs[ar]][version]["beta"]){
          gapps[archs[ar]][version] = {"variant": [],"downloads":{},"beta": false};
        }
        if (!gapps[archs[ar]][version]["variant"].includes(variant)) {
          gapps[archs[ar]][version]["variant"].push(variant);
          let gfile = fileroot.querySelector('#files_list').childNodes[11].childNodes.find(n => n.rawAttrs === `title="${sel}" class="file "`).childNodes;
          let download;
          if(infos[`${sel}.md5`] !== undefined){
            download = {
              "name": sel,
              "date": Math.floor(new Date(gfile.find(n => n.rawAttrs === 'headers="files_date_h" class="opt"').childNodes[0].rawAttrs.split('"')[1]).getTime()/1000),
              "filedate": time,
              "size": gfile.find(n => n.rawAttrs === `headers="files_size_h" class="opt"`).childNodes[0].rawText.replace(/\s/g, ""),
              "md5file": {
                "name": `${sel}.md5`,
                "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/${time}/${sel}.md5?r=&ts={time}&use_mirror=autoselect`
              },
              "md5": info.md5,
              "sha1": info.sha1,
              "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/${time}/${sel}?r=&ts={time}&use_mirror=autoselect`
            }
          } else {
            download = {
              "name": sel,
              "date": Math.floor(new Date(gfile.find(n => n.rawAttrs === 'headers="files_date_h" class="opt"').childNodes[0].rawAttrs.split('"')[1]).getTime()/1000),
              "filedate": time,
              "size": gfile.find(n => n.rawAttrs === `headers="files_size_h" class="opt"`).childNodes[0].rawText.replace(/\s/g, ""),
              "md5": info.md5,
              "sha1": info.sha1,
              "download": `https://downloads.sourceforge.net/project/opengapps/${archs[ar]}/${time}/${sel}?r=&ts={time}&use_mirror=autoselect`
            }
          }
          gapps[archs[ar]][version]["downloads"][variant] = download;
        }
      }
    }
  }
  fs.writeFileSync('./gapps.json', JSON.stringify(gapps, null, 2), function(err) {if (err) throw err})
}, 43200000)
