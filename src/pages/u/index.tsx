export const getServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: true,
  },
})

const Index = () => <></>

export default Index
