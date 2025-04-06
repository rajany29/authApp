'use client'
import { useRouter } from "next/navigation";
import { Button } from "primereact/button"


const   ProductsPage =()=>{
    const router = useRouter();
    return(
        <div>
          <Button label="Primary" icon="pi pi-check" className="p-button-primary" onClick={()=>router.push('/')} />
        </div>
    )
}
export default ProductsPage