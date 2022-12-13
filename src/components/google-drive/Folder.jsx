import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'react-bootstrap'

const Folder = ({ folder }) => {
  return (
    <Button as={Link} to={`/folder/${folder.id}`} state={{ folder }} variant='outline-dark' className='text-truncate w-100'>
      <FontAwesomeIcon icon={faFolder} className='me-2' />
      {folder.name}
    </Button>
  )
}

export default Folder