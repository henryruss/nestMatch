export default function PhoneFrame({ children }) {
  return (
    <div className="phone-frame-outer">
      <div className="phone-frame-inner scrollbar-hide">
        <div className="dynamic-island" />
        {children}
      </div>
    </div>
  )
}
