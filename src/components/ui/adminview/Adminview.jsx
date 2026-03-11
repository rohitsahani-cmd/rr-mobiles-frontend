import React from 'react'
import { Outlet } from 'react-router-dom'

const Adminview = () => {
  return (

    <div className='flex min-h-screen w=full'>
        this is admin view
        {/* admin sidebar */}
        <div className='flex flex-1 flex-col'></div>
        {/* adminheader */}
        <main className='"flex-1 flex bg-muted/40 p-4 md:p-6'>
            <Outlet/>
        </main>



    </div>
  )
}

export default Adminview