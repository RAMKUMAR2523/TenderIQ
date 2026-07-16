import{a as e}from"./index-5PXj5RIs.js";async function t(t,n){let r=e.from(`tenders`).select(`
    *,
    companies:company_tenders(*),
    documents(*)
  `).order(`createdAt`,{ascending:!1});t&&(r=r.or(`title.ilike.%${t}%,description.ilike.%${t}%,department.ilike.%${t}%`)),n&&n!==`All`&&(r=r.eq(`department`,n));let{data:i,error:a}=await r;return a?(console.error(`Error fetching tenders:`,a),[]):i}async function n(t){let{data:n,error:r}=await e.from(`tenders`).select(`
    *,
    documents(*),
    companies:company_tenders(
      *,
      company:companies(*)
    )
  `).eq(`id`,t).single();return r?(console.error(`Error fetching tender by id:`,r),null):n}async function r(t){let{data:n}=await e.auth.getUser();if(!n?.user)return{error:`User is not authenticated.`};let r=n.user.user_metadata?.companyId;if(!r)return{error:`User is not associated with a company.`};try{let{error:n}=await e.from(`company_tenders`).upsert({companyId:r,tenderId:t,status:`INTERESTED`},{onConflict:`companyId,tenderId`});if(n)throw n;return{success:!0}}catch(e){return console.error(`Error saving tender interest:`,e),{error:`Failed to save interest.`}}}export{t as n,r,n as t};