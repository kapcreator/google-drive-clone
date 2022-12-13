import { faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { storage, database } from '../../firebase'
import { ROOT_FOLDER } from '../../hooks/useFolder'
import { v4 as uuidV4 } from 'uuid'
import { ProgressBar, Toast } from 'react-bootstrap'

const AddFileButton = ({ currentFolder }) => {
  const [uploadingFiles, setUploadingFiles] = useState([])
  const { currentUser } = useAuth()

  const handleUpload = (e) => {
    const file = e.target.files[0]
    e.target.value = null 
    if(currentFolder == null || file == null) return

    const id = uuidV4()
    let fileData = { id: id, name: file.name, progress: 0, error: false }
    setUploadingFiles(prev => [...prev, fileData])

    const filePath = currentFolder === ROOT_FOLDER ? file.name : `${currentFolder.path.join('/')}/${currentFolder.name}/${file.name}`

    const uploadTask = storage.ref(`/files/${currentUser.uid}/${filePath}`).put(file)

    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes

      setUploadingFiles(prev => {
        return prev.map(file => {
          if (file.id === id) {
            return { ...file, progress: progress }
          }

          return file
        })
      })
    },
    (err) => {
      console.log(err)
      setUploadingFiles(prev => (
        prev.map(file => {
          if (file.id === id) {
            return { ...file, error: true }
          }
          return file
        })
      ))
    },
    () => {
      setUploadingFiles(prev => (
        prev.filter(file => (
          file.id !== id
        ))
      ))

      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        database.files
          .where('name', '==', file.name)
          .where('userId', '==', currentUser.uid)
          .where('folderId', '==', currentFolder.id)
          .get()
          .then(existingFiles => {
            const existingFile = existingFiles.docs[0]
            if (existingFile) {
              existingFile.ref.update({ url: url })
            } else {
              database.files.add({
                url: url,
                name: file.name,
                createdAt: database.getCurrentTimestamp(),
                folderId: currentFolder.id,
                userId: currentUser.uid,
              })
            }
          })
      })
    })

  }
  
  return (
    <>
      <label className='btn btn-outline-success btn-sm m-0 me-2'>
        <FontAwesomeIcon icon={faFileUpload} />
        <input type='file' onChange={handleUpload} style={{ opacity: 0, position: 'absolute', left: '-9999px'}} />
      </label>
      {uploadingFiles.length > 0 && <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          maxWidth: '250px',
        }}>
          {uploadingFiles.map(uploadingFile => (
            <Toast key={uploadingFile.id} onClose={()=> {
              setUploadingFiles(prev => prev.filter(file => file.id !== uploadingFile.id))
            }}>
              <Toast.Header closeButton={uploadingFile.error} className="text-truncate w-100 d-block">
                {uploadingFile.name}
              </Toast.Header>
              <Toast.Body>
                <ProgressBar
                  animated={!uploadingFile.error}
                  variant={uploadingFile.error ? "danger" : "primary"}
                  now={uploadingFile.error ? 100 : uploadingFile.progress * 100}
                  label={
                    uploadingFile.error
                      ? "Error"
                      : `${Math.round(uploadingFile.progress * 100)}%`
                  }
                />
              </Toast.Body>
            </Toast>
          ))}
        </div>}
    </>
  )
}

export default AddFileButton