// Carefully curated official Singapore education, technical and skills portals.
// Entries are discovery metadata, not evidence that we downloaded an entire portal.
export const SINGAPORE_RESOURCES = Object.freeze([
  {name:'POLITEMall',category:'ITE & Polytechnic',publisher:'Singapore ITE and five polytechnics',description:'Online learning materials in engineering, IT, business, sciences and other disciplines. Some modules require student login.',url:'https://politemall.polite.edu.sg/',tags:'ite poly course learning lessons engineering cybersecurity'},
  {name:'ITE Learning and Career Resources',category:'ITE',publisher:'Institute of Technical Education',description:'Official career guidance and graduate employment learning resources.',url:'https://www.ite.edu.sg/alumni/career-guidance-and-services/career-guidance/',tags:'ite jobs graduate skills interview career'},
  {name:'ITE Applied Learning Modules',category:'ITE',publisher:'Institute of Technical Education',description:'Applied modules for secondary learners, including engineering and infocomm technology.',url:'https://www.ite.edu.sg/secondary-school-students/applied-learning-modules/modules/',tags:'ite applied learning ai cybersecurity coding engineering'},
  {name:'POLITE Technology Resources',category:'Polytechnic & ITE',publisher:'ITE and five Singapore polytechnics',description:'Discover technology facilities and expertise across ITE and polytechnics.',url:'https://techresources.polite.edu.sg/',tags:'poly ite technology facilities laboratory research'},
  {name:'SkillsFuture Singapore',category:'Work Skills',publisher:'SkillsFuture Singapore',description:'Lifelong learning, career pathways and continuing education opportunities.',url:'https://www.myskillsfuture.gov.sg/',tags:'skillsfuture wsq work skills job reskilling course career'},
  {name:'SkillsFuture Official FAQ',category:'Work Skills',publisher:'Singapore Government',description:'Official answers about courses, applications and SkillsFuture programmes.',url:'https://ask.gov.sg/skillsfuture',tags:'skillsfuture funding faq courses skill training'},
  {name:'MySkillsFuture Applied Learning Modules',category:'ITE & Polytechnic',publisher:'SkillsFuture Singapore',description:'Browse applied learning modules provided by ITE and polytechnics.',url:'https://www.myskillsfuture.gov.sg/content/student/en/aplm.html',tags:'ite poly applied learning courses'},
  {name:'Skills Training & Enhancement Portal',category:'Work Skills',publisher:'ITE and polytechnics',description:'Course application information for continuing education and WSQ training.',url:'https://www.ite.edu.sg/adult-learners/workforce-skills-qualification-wsq-and-joint-industry-certification/workforce-skills-qualification-wsq/application-procedure-workforce-skills-qualification-wsq/',tags:'wsq step course adult education poly ite'},
  {name:'MOE Student Learning Space',category:'MOE',publisher:'Ministry of Education Singapore',description:'MOE Library self-study resources accessed through eligible SLS accounts; materials may require login.',url:'https://www.learning.moe.edu.sg/students/student-user-guide/discover/',tags:'moe sls school learning self-study education'},
]);
export function selectResources(question, limit=5) {
  const terms=new Set(String(question||'').toLowerCase().match(/[a-z]{3,}/g)||[]);
  const common=new Set(['what','does','where','with','about','would','from','some','make','please','give','when','your','this','that','study','help']);
  const scored=SINGAPORE_RESOURCES.map(item=>{
    const hay=`${item.name} ${item.tags} ${item.description}`.toLowerCase();
    const score=[...terms].filter(t=>!common.has(t)&&hay.includes(t)).length;
    return {item,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
  return scored.map(({item})=>({name:item.name,publisher:item.publisher,description:item.description,url:item.url,category:item.category,access:'Link may require an existing institutional login; content has not been verified in this request.'}));
}
