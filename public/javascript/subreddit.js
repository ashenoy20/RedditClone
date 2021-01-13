
const rows = document.querySelectorAll(".row")


for(let row of rows){
    const card = row.lastElementChild
    const circle = row.firstElementChild
    console.log(card)
    console.log(circle)
    card.addEventListener('mouseover', (e) => {
        circle.style.transform = `translateX(${50}px)` 
        card.style.cursor = "pointer"
    })
    card.addEventListener('mouseout', (e) => {
        circle.style.transform = `translateX(${0}px)`  
  
    })
    // card.addEventListener('click', () => {
    //     window.location.href = "www.google.com"
    // })
}


