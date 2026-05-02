const fs = require('fs');
const path = require('path');

const cleanEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}]/gu, '').replace(/  +/g, ' ').trim();
};

const removeEmojisMultiline = (str) => {
    return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}]/gu, '');
};

const features = [
  'weather', 'drought', 'irrigation', 'pest', 'ndvi', 'market', 
  'reports', 'knowledge', 'community', 'alerts', 'treatments'
];

const basePath = path.join(__dirname, 'src/app/features');

features.forEach(feature => {
  const dir = path.join(basePath, feature);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const capitalized = feature.charAt(0).toUpperCase() + feature.slice(1);
  const moduleName = `${capitalized}Module`;
  const componentName = `${capitalized}Component`;

  const moduleContent = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ${componentName} } from './${feature}.component';
import { AppLayoutComponent } from '../../shared/layout/app-layout.component';

@NgModule({
  declarations: [${componentName}],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule,
    RouterModule.forChild([{
      path: '', component: AppLayoutComponent,
      children: [{ path: '', component: ${componentName} }]
    }])
  ]
})
export class ${moduleName} {}
`;

  fs.writeFileSync(path.join(dir, `${feature}.module.ts`), moduleContent);
  fs.writeFileSync(path.join(dir, `${feature}.component.css`), ''); // Empty for now, will fill later
});

console.log("Modules generated");
