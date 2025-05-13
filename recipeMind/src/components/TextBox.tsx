import React, { useState} from 'react'

type Props = {}

function TextBox(): JSX.Element {
  const [name, setName] = useState<string>("");
  return(
    <div>
      <h2>Enter</h2>
      <form action="">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}/>
      </form>
    </div>
  )
}

export default TextBox