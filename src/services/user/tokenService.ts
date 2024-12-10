export const tokenService = {
    setToken:(accessTokem:string,refreshToken:string)=>{
        localStorage.setItem('accessToken',accessTokem)    
        localStorage.setItem('refreshToken',refreshToken)
    },
    getAccessToken:()=>localStorage.getItem('accessToken'),
    getRefreshToken:()=>localStorage.getItem('refreshToken'),
    clearToken:()=>{
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    },
    setAdminToken:(accessToken:string)=> localStorage.setItem('adminAccessToken',accessToken),
    getAdminAccessToken:()=>localStorage.getItem('adminAccessToken'),
    adminClearToken:()=> localStorage.removeItem('adminAccessToken')
}