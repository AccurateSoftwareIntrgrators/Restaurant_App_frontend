import React from 'react'
import MenuItem from './Pages/MenuItems/MenuItem'
import FoodTypePage from './Pages/FoodTypes/FoodTypePage'
import LocationPage from './Pages/Locations/LocationPage'
import OrderTypePage from './Pages/OrderTypes/OrderTypePage'

const App = () => {
  return (
    <div>
      <MenuItem />

      <FoodTypePage />

      <LocationPage />

      <OrderTypePage />
    </div>
  )
}

export default App
