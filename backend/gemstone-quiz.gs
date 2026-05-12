/* IGI Colored Gemstone Quiz — Google Apps Script
   Sheet ID: 18Y1HzXXBgcD9KmSOlwCJcAAPclct1GSLbh44ykBeGQ0
   SETUP: Paste this into a new Apps Script project → Deploy as Web App → Copy URL → paste into app.js GAS_URL */

const SHEET_ID = '18Y1HzXXBgcD9KmSOlwCJcAAPclct1GSLbh44ykBeGQ0';
const TEAL='#094d59',GOLD='#c9a84c',WHITE='#ffffff',RUBY='#c0392b',GREEN='#27ae60';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.openById(SHEET_ID);
    if (data.source === 'course_interest_gemstone') writeCourseInterest(ss, data);
    else { writeGemstoneResponse(ss, data); writeWrongAnswers(ss, data); }
    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function writeGemstoneResponse(ss, data) {
  const TAB = 'Gemstone Leads';
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB);
    const headers = ['Timestamp','Name','Email','Country Code','Mobile','Country','City','Profession','Score','Total','Percentage','Badge','Time Taken','Submit Reason','Device','Screen Res','Wrong Q Count','Submitted At'];
    const hr = sheet.getRange(1,1,1,headers.length);
    hr.setValues([headers]).setFontWeight('bold').setBackground(TEAL).setFontColor(WHITE).setFontFamily('Arial');
    sheet.setFrozenRows(1);
    [160,140,200,110,120,110,110,160,60,60,90,150,100,150,90,110,90,160].forEach((w,i)=>sheet.setColumnWidth(i+1,w));
  }
  const pct = Math.round((data.score/data.total)*100);
  const badge = pct>=92?'🏆 Gemstone Expert':pct>=76?'💎 Gem Connoisseur':pct>=60?'🌿 On Your Way':'📚 Keep Exploring';
  sheet.appendRow([new Date(),data.name||'',data.email||'',data.countryCode||'',data.mobile||'',data.country||'',data.city||'',data.profession||'',data.score||0,data.total||25,data.pct||(pct+'%'),badge,data.timeTaken||'',data.submitReason||'',data.deviceType||'',data.screenRes||'',(data.wrongAnswers||[]).length,data.submittedAt||new Date().toISOString()]);
  colorCodeBadges(sheet);
}

function colorCodeBadges(sheet) {
  const lr = sheet.getLastRow();
  if (lr < 2) return;
  sheet.getRange(2,12,lr-1,1).getValues().forEach((row,i)=>{
    const c = sheet.getRange(i+2,12), v = row[0]||'';
    if(v.includes('Gemstone Expert'))     c.setBackground('#fef9e7').setFontColor('#c9a84c');
    else if(v.includes('Gem Connoisseur'))c.setBackground('#eafaf1').setFontColor('#27ae60');
    else if(v.includes('On Your Way'))    c.setBackground('#eaf4fb').setFontColor('#2980b9');
    else if(v.includes('Keep Exploring')) c.setBackground('#f5eef8').setFontColor('#6c3483');
  });
}

function writeWrongAnswers(ss, data) {
  if (!data.wrongAnswers || data.wrongAnswers.length === 0) return;
  const TAB = 'Wrong Answers';
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB);
    const headers = ['Timestamp','Name','Email','Q No.','Question','Their Answer','Correct Answer'];
    sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground(RUBY).setFontColor(WHITE).setFontFamily('Arial');
    sheet.setFrozenRows(1);
    [160,140,200,60,360,220,220].forEach((w,i)=>sheet.setColumnWidth(i+1,w));
  }
  data.wrongAnswers.forEach(w=>sheet.appendRow([new Date(),data.name||'',data.email||'',w.qNum||'',w.question||'',w.given||'',w.correct||'']));
}

function writeCourseInterest(ss, data) {
  const TAB = 'Course Enquiries';
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB);
    const headers = ['Timestamp','Name','Email','Country Code','Mobile','Country','City','Profession','Course Selected','Score','Total','Percentage','Submitted At'];
    sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground(GOLD).setFontColor('#071c20').setFontFamily('Arial');
    sheet.setFrozenRows(1);
    [140,140,200,100,120,110,110,160,200,60,60,90,160].forEach((w,i)=>sheet.setColumnWidth(i+1,w));
  }
  sheet.appendRow([new Date(),data.name||'',data.email||'',data.countryCode||'',data.mobile||'',data.country||'',data.city||'',data.profession||'',data.course||'',data.score||'',data.total||'',data.pct||'',data.submittedAt||new Date().toISOString()]);
}

function buildDashboard() {
  const ss=SpreadsheetApp.openById(SHEET_ID),src=ss.getSheetByName('Gemstone Leads');
  if(!src||src.getLastRow()<2)return;
  let dash=ss.getSheetByName('Dashboard');
  if(!dash)dash=ss.insertSheet('Dashboard');else dash.clearContents();
  dash.getRange('A1').setValue('IGI GEMSTONE QUIZ — DASHBOARD').setFontWeight('bold').setFontSize(13).setBackground(TEAL).setFontColor(GOLD);
  dash.getRange('A1:F1').merge();
  const data=src.getRange(2,1,src.getLastRow()-1,18).getValues().filter(r=>r[0]!=='');
  const total=data.length,avgScore=total?(data.reduce((a,r)=>a+(r[8]||0),0)/total).toFixed(1):0,avgPct=total?(data.reduce((a,r)=>a+parseInt(r[10]||0),0)/total).toFixed(0):0;
  dash.getRange('A4').setValue('SUMMARY').setFontWeight('bold').setBackground(TEAL).setFontColor(WHITE);
  [['Total Responses',total],['Average Score',avgScore+' / 25'],['Average %',avgPct+'%']].forEach(([k,v],i)=>{dash.getRange(5+i,1).setValue(k);dash.getRange(5+i,2).setValue(v).setFontWeight('bold');});
  const badges={};data.forEach(r=>{const b=r[11]||'Unknown';badges[b]=(badges[b]||0)+1;});
  dash.getRange('A9').setValue('BADGE BREAKDOWN').setFontWeight('bold').setBackground(GOLD).setFontColor('#071c20');
  let row=10;Object.entries(badges).forEach(([b,c])=>{dash.getRange(row,1).setValue(b);dash.getRange(row,2).setValue(c);row++;});
  const countries={};data.forEach(r=>{const c=r[5]||'Unknown';countries[c]=(countries[c]||0)+1;});
  dash.getRange('D4').setValue('TOP COUNTRIES').setFontWeight('bold').setBackground(TEAL).setFontColor(WHITE);
  Object.entries(countries).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([c,n],i)=>{dash.getRange(5+i,4).setValue(c);dash.getRange(5+i,5).setValue(n);});
  SpreadsheetApp.flush();
}

// Run ONCE manually to set daily auto-refresh
function createDailyTrigger() {
  ScriptApp.newTrigger('buildDashboard').timeBased().everyDays(1).atHour(6).create();
}
