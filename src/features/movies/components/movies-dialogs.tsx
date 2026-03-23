import { MoviesActionDialog } from './movies-action-dialog'
import { useMovies } from './movies-provider'

export function MoviesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMovies()
  return (
    <>
      <MoviesActionDialog
        key='movie-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <MoviesActionDialog
          key={`movie-update-${currentRow.id}`}
          open={open === 'update'}
          onOpenChange={() => {
            setOpen('update')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}

