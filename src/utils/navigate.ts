
let navigateFunction:(path:string)=>void // Variable to store the `navigate` function

export const setNavigateFunction = (navigate:(path:string)=>void) => {
    navigateFunction = navigate  // Store the function globally
};


export const navigateTo = (path:string)=>{
    if(navigateFunction){
        navigateFunction(path)
    }else {
        console.error("Navigate function is not set");
      }
}