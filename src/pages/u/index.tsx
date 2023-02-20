export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/',
      permanent: true,
    },
  }
}

const Index = () => <></>

export default Index
