import React from 'react'
import Link from '@docusaurus/Link'

export const ReadMore = ({
  url,
  title = 'Link',
}: {
  url: string
  title?: string
}) => {
  return (
    <div>
      Read more at{' '}
      <Link href={url} target="_blank">
        {title}
      </Link>
    </div>
  )
}
