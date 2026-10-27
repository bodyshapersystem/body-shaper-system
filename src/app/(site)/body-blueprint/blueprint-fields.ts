export const blueprintSections = [
  {title:"About You",fields:[
    {id:"firstName",label:"First Name",type:"text",required:true},
    {id:"lastName",label:"Last Name",type:"text",required:true},
    {id:"email",label:"Email Address",type:"email",required:true},
    {id:"phone",label:"Phone Number",type:"tel",required:true},
    {id:"dateOfBirth",label:"Date of Birth",type:"date"},
    {id:"city",label:"Which area are you located in?",type:"select",required:true,options:["Miami","Miami Beach","Brickell / Downtown","Coral Gables","Coconut Grove","Kendall","Doral","Hialeah","Aventura","North Miami","Fort Lauderdale","West Palm Beach","Other"]},
    {id:"buildingAccess",label:"Does your building require any of the following?",type:"multiple",options:["Valet Parking","Paid Parking Garage","Gate Code","Concierge Access","Elevator","Stairs Only","Street Parking Available","Other"]},
    {id:"referralSource",label:"How did you hear about us?",type:"multiple",required:true,options:["Instagram","Facebook","TikTok","Google Search","Google Maps","Friend / Family","Existing Client","Event","Other"]},
    {id:"referredBy",label:"Who may we thank for referring you?",type:"text"}
  ]},
  {title:"Your Goals",fields:[
    {id:"goals",label:"What would you like to improve?",type:"multiple",required:true,options:["Body Contouring","Localized Fat Reduction","Skin Tightening","Cellulite Improvement","Muscle Toning","Lymphatic Drainage","Postpartum Recovery","Post-Surgical Recovery","Facial Rejuvenation","Other"]},
    {id:"areas",label:"Which areas would you love to transform?",type:"multiple",required:true,options:["Abdomen","Waist","Flanks","Back","Arms","Inner Thighs","Outer Thighs","Glutes","Hips","Knees","Chin / Jawline","Face","Full Body","Other"]},
    {id:"oneChange",label:"If you could change one thing about your body today, what would it be?",type:"textarea"}
  ]},
  {title:"Your Timeline",fields:[
    {id:"startTimeline",label:"When would you like to begin?",type:"single",required:true,options:["This week","Within the next 2 weeks","This month","I'm just exploring"]},
    {id:"hasEvent",label:"Do you have an upcoming event?",type:"single",required:true,options:["Yes","No"]},
    {id:"eventDate",label:"Event Date",type:"date",showWhen:{id:"hasEvent",value:"Yes"}},
    {id:"eventType",label:"What are you preparing for?",type:"single",options:["Vacation","Wedding","Birthday","Photoshoot","Special Event","Other"],showWhen:{id:"hasEvent",value:"Yes"}}
  ]},
  {title:"Your Experience",fields:[
    {id:"previousTreatments",label:"Have you had body treatments before?",type:"multiple",required:true,options:["Exilis®","EMS","Endospheres®","Lymphatic Drainage","Radiofrequency","Cryolipolysis","Liposuction","Tummy Tuck","None","Other"]},
    {id:"previousExperience",label:"How was your experience?",type:"single",options:["Great","Some improvement","I didn't see results","The results didn't last"]}
  ]},
  {title:"Your Priorities",fields:[
    {id:"biggestChallenge",label:"What has been your biggest challenge?",type:"multiple",required:true,options:["Lack of time","Previous treatments didn't work","Hormonal changes","Pregnancy","Surgery","Not knowing where to start","Staying consistent","Other"]},
    {id:"priorities",label:"What matters most to you?",type:"multiple",required:true,options:["Visible Results","Personalized Plan","Advanced Technology","Convenience","Long-Term Results","Natural-Looking Results"]},
    {id:"commitment",label:"How committed are you to starting?",type:"single",required:true,options:["Ready to begin immediately","Within the next 30 days","Still exploring"]},
    {id:"investment",label:"Preferred Investment Option",type:"single",required:true,options:["Pay in Full","Two Payments","Three Payments","I'd like your recommendation"]}
  ]},
  {title:"Your Vision",fields:[
    {id:"vision",label:"Imagine we're celebrating your results three months from now. What would make you say: 'I'm so glad I did this.'",type:"textarea"}
  ]}
] as const;
