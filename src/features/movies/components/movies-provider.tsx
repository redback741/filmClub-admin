import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Movie } from '../data/schema'

type DialogType = 'create' | 'update' | 'delete' | 'import' | 'status'

type MoviesContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Movie | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Movie | null>>
}

const MoviesContext = React.createContext<MoviesContextType | null>(null)

export function MoviesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>(null)  
  const [currentRow, setCurrentRow] = useState<Movie | null>(null)

  return (
    <MoviesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MoviesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMovies = () => {
  const moviesContext = React.useContext(MoviesContext)

  if (!moviesContext) {
    throw new Error('useMovies has to be used within <MoviesContext>')
  }

  return moviesContext
}
