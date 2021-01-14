const navButton = document.querySelector('.button')
const boxes = document.querySelectorAll('.box')
const logo = document.querySelector('.logo')
const navBar = document.querySelector('.navBar')
const vl = document.querySelector('.nav-vertical-line')
const home = document.querySelector('.home')
const explore = document.querySelector('.explore')
const login = document.querySelector('.login')
const content = document.querySelector('.content')


let isCollapsed = false


for(let i of boxes){
    i.addEventListener('mouseover', () => {
        i.style.cursor = 'pointer'
    })
}

home.addEventListener('click', () => {
     window.location.href = "/"
})

explore.addEventListener('click', () => {
    window.location.href = "/subreddits"
})

if(login){
  login.addEventListener('click', () => {
    window.location.href = "/login"
  })
}


function goToProfile() {
    window.location.href = "/profile"
}


navButton.addEventListener('mouseover', () => {
    navButton.style.cursor = 'pointer'
})

navButton.addEventListener('click', () => {

    if(window.location.pathname === '/subreddits'){
        isCollapsed = !isCollapsed
        if(isCollapsed){
            logo.style.display = "none"
            vl.style.display = "none"
            for(let i of boxes){
                i.style.display = "none"
            }
            content.style.marginTop = '10px'
            navBar.style.width = "7%"
            navBar.style.height = "220px"
            navBar.style.backgroundColor = "#ffd369"
            navBar.style.right = "0%"
            
        }else{
            logo.style.display = "flex"
            vl.style.display = null
            for(let i of boxes){
                i.style.display = "flex"
            }
            content.style.marginTop = '170px'
            navBar.style.width = "99%"
            navBar.style.height = "auto"
            navBar.style.backgroundColor = "#222831"
            navBar.removeAttribute("right")
            
        }
    }
    
})