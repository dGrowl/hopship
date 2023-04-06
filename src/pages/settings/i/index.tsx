export const getServerSideProps = () => ({
  redirect: {
    destination: '/settings',
    permanent: true,
  },
})

const Index = () => <></>

export default Index
