import prettyMilliseconds from 'pretty-ms';

export const timeformat = (date:string) =>{
   return prettyMilliseconds(Date.now() - new Date(date).getTime(),{
    compact:true,
    unitCount:1
   })
}