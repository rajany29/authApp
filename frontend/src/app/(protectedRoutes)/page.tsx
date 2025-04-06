'use client'
import { useAuth } from "@/context/UserContext";

const HomePage = ()=>{
    const {user} = useAuth()
    console.log({user})
    return(
        <div>
            hello
        </div>
    )
}

export default HomePage;