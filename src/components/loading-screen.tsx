export default function LoadingScreen() {
  const wrapper = {
    top: '50%'
  };

  return (
    <div className="fixed top-0 left-0 z-50 block w-full h-full bg-white opacity-75">
      <span className="relative block w-0 h-0 mx-auto my-0 opacity-75 top-1/2" style={wrapper}>
        <i className="fas fa-circle-notch fa-spin fa-5x"></i>
        LOADING
      </span>
    </div>
  )
};
