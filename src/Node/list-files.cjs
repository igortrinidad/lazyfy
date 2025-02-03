const fs = require('fs');
const path = require('path');

function getFolderStructure(folderPath, rootPath = folderPath) {
  const folderName = path.basename(folderPath);
  const result = {
    [folderName]: {
      name: folderName,
      path: path.relative(rootPath, folderPath) || '.',
      items: [],
    },
  };

  const entries = fs.readdirSync(folderPath);
  entries.forEach((entry) => {
    const fullPath = path.join(folderPath, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subResult = getFolderStructure(fullPath, rootPath);
      Object.assign(result[folderName], subResult);
    } else {
      const relativeItem = path.relative(rootPath, fullPath);
      result[folderName].items.push(relativeItem);
    }
  });

  return result;
}

const baseFolder = process.argv[2] || '.';
console.log(JSON.stringify(getFolderStructure(path.resolve(baseFolder)), null, 2));
fs.writeFileSync('files.json', JSON.stringify(getFolderStructure(path.resolve(baseFolder)), null, 2));