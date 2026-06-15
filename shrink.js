const fs = require('fs');

const pathJsx = 'src/pages/User/PropertyDetails.jsx';
let contentJsx = fs.readFileSync(pathJsx, 'utf8');

contentJsx = contentJsx.replace(/fontSize:\s*['"]1\.[4-8]rem['"]/g, 'fontSize: \'1.1rem\'');
contentJsx = contentJsx.replace(/fontSize:\s*['"]1\.[1-3]rem['"]/g, 'fontSize: \'0.95rem\'');
contentJsx = contentJsx.replace(/fontSize:\s*['"]0\.[8-9][5]?rem['"]/g, 'fontSize: \'0.75rem\'');
contentJsx = contentJsx.replace(/fontSize:\s*['"]0\.[6-7][5]?rem['"]/g, 'fontSize: \'0.65rem\'');
contentJsx = contentJsx.replace(/fontSize:\s*['"]2\.[0-9]rem['"]/g, 'fontSize: \'1.3rem\'');
contentJsx = contentJsx.replace(/fs-1/g, 'fs-3');
contentJsx = contentJsx.replace(/fs-2/g, 'fs-4');
contentJsx = contentJsx.replace(/fs-3/g, 'fs-5');
contentJsx = contentJsx.replace(/fs-4/g, 'fs-6');

fs.writeFileSync(pathJsx, contentJsx);
console.log('Updated inline fonts in JSX');

const pathCss = 'src/pages/User/PropertyDetails.css';
let contentCss = fs.readFileSync(pathCss, 'utf8');

contentCss = contentCss.replace(/font-size:\s*1\.[6-9]rem/g, 'font-size: 1.15rem');
contentCss = contentCss.replace(/font-size:\s*1\.[3-5]rem/g, 'font-size: 1.05rem');
contentCss = contentCss.replace(/font-size:\s*1\.[1-2]rem/g, 'font-size: 0.95rem');
contentCss = contentCss.replace(/font-size:\s*1rem/g, 'font-size: 0.85rem');
contentCss = contentCss.replace(/font-size:\s*0\.[9]5?rem/g, 'font-size: 0.8rem');
contentCss = contentCss.replace(/font-size:\s*0\.[8]5?rem/g, 'font-size: 0.75rem');
contentCss = contentCss.replace(/font-size:\s*0\.[7]5?rem/g, 'font-size: 0.65rem');

fs.writeFileSync(pathCss, contentCss);
console.log('Updated font sizes in CSS');
