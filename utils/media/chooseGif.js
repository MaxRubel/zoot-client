export const chooseGif = () => {
    const val = Math.floor(Math.random() * 8)

    switch(val){
        case 0:
            return '/relax1.webp'
        case 1:
            return '/relax2.webp'        
        case 2:
            return '/relax3.webp'
        case 3:
            return '/relax4.webp'
        case 4:
            return '/relax5.webp'
        case 5:
            return '/relax6.webp'
        case 6:
            return '/relax7.webp'
        case 7:
            return '/relax8.webp'
    }
}