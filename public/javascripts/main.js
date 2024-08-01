
console.log('main.js')
window.onload = () => {
  console.log('window onload')
  $(() => {
    console.log('jquery ready', $)
    $('.btn-delete-file').on('click', (e) => {
      console.log(e.target.dataset.url)
      fetch(`/delete?path=${e.target.dataset.url}`).then((res) => {
        console.log(res)
        window.location.reload()
      })
    })

  })
}