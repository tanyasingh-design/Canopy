import svgPaths from "./svg-6u7fivpy43";
import imgLayout from "./2ca917b71f87fad0b2b734eae7a7e887ca0cc7cc.png";
import imgContainer from "./07d24c3c5d85743059485b9edbb13116818785d1.png";
import imgImageFlower from "./72d045a7dfd8d93f1b462f0ab3e7b6222798b6aa.png";
import imgImageFlower1 from "./fda4ebdd09cea197d94d7c5ce76a772096ee288d.png";

function Layout() {
  return <div className="bg-[#f8f4ee] h-[852.804px] relative shrink-0 w-full" data-name="Layout" />;
}

function Layout1() {
  return (
    <div className="absolute h-[852.804px] left-0 top-0 w-[392.72px]" data-name="Layout">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[35.18%] left-0 max-w-none top-0 w-[76.39%]" src={imgLayout} />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[852.804px] left-0 top-0 w-[392.72px]" data-name="Container">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[35.18%] left-0 max-w-none top-0 w-[76.39%]" src={imgContainer} />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[16.494px] relative shrink-0 w-[70.444px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#7a6a58] text-[11px] top-[0.43px] tracking-[0.44px] whitespace-nowrap">Jun 9</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[rgba(255,252,247,0.82)] relative rounded-[24046500px] shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[0.717px] border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[24046500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12.717px] py-[6.717px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[16.494px] relative shrink-0 w-[70.444px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#b8a898] text-[11px] top-[0.43px] tracking-[0.44px] whitespace-nowrap">4 planted</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(255,252,247,0.82)] relative rounded-[24046500px] shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[0.717px] border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[24046500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12.717px] py-[6.717px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-[95.877px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[6px] items-start relative size-full">
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[16.494px] relative shrink-0 w-[59.213px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[word-break:break-word] absolute font-['Lora:Regular',sans-serif] font-normal leading-[16.5px] left-0 text-[#7c9a7e] text-[11px] top-[0.43px] whitespace-nowrap">$1570 saved</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[rgba(255,252,247,0.82)] relative rounded-[24046500px] shrink-0" data-name="Container">
      <div aria-hidden className="absolute border-[0.717px] border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[24046500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12.717px] py-[6.717px] relative size-full">
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-0 pt-[48px] px-[20px] top-0 w-[392.72px]" data-name="Container">
      <Container2 />
      <Container5 />
    </div>
  );
}

function ImageFlower() {
  return (
    <div className="h-[77px] relative shrink-0 w-full" data-name="Image (flower)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageFlower} />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[#faf7f0] relative rounded-[16px] shrink-0 size-[77px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ImageFlower />
      </div>
    </div>
  );
}

function ImageFlower1() {
  return (
    <div className="blur-[1px] h-[33.872px] opacity-20 relative w-[41.823px]" data-name="Image (flower)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-bottom pointer-events-none size-full" src={imgImageFlower1} />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="Button">
      <Container6 />
      <div className="absolute flex h-[52.26px] items-center justify-center left-[35.85px] top-[37.13px] w-[48.447px]">
        <div className="flex-none rotate-[115.18deg]">
          <ImageFlower1 />
        </div>
      </div>
    </div>
  );
}

function Garden() {
  return (
    <div className="absolute bg-[#faf7f0] h-[852.804px] left-0 top-0 w-[392.72px]" data-name="Garden">
      <Container />
      <Container1 />
      <div className="absolute flex items-center justify-center left-[214.87px] size-[95.241px] top-[431.87px]">
        <div className="-rotate-16 flex-none">
          <Button />
        </div>
      </div>
    </div>
  );
}

function Layout2() {
  return (
    <div className="absolute h-[852.804px] left-0 top-0 w-[392.72px]" data-name="Layout">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Garden />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[23.996px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9963 23.9963">
        <g id="Icon">
          <path d={svgPaths.p190195c0} id="Vector" stroke="var(--stroke-0, #7C9A7E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
          <path d={svgPaths.pe9de80} id="Vector_2" stroke="var(--stroke-0, #7C9A7E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
          <path d="M11.9981 9.99846V21.9966" id="Vector_3" stroke="var(--stroke-0, #7C9A7E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
          <path d={svgPaths.p2add8380} id="Vector_4" stroke="var(--stroke-0, #7C9A7E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
          <path d={svgPaths.p10642e80} id="Vector_5" stroke="var(--stroke-0, #7C9A7E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[13.325px] relative shrink-0 w-[36.616px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-[18.5px] not-italic text-[#7c9a7e] text-[10px] text-center top-0 tracking-[0.5px] whitespace-nowrap">garden</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-center left-[64.2px] top-[11.99px]" data-name="Button">
      <Icon />
      <Text />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[23.996px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9963 23.9963">
        <g id="Icon">
          <path d="M4.99923 11.9981H18.9971" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.49961" />
          <path d="M11.9981 4.99923V18.9971" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.49961" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch drop-shadow-[0px_4px_10px_rgba(107,146,104,0.4)] flex items-center justify-center left-[165.23px] rounded-[24046500px] size-[55.999px] top-[-7.35px]" style={{ backgroundImage: "linear-gradient(145deg, rgb(143, 174, 139) 6.1733%, rgb(107, 146, 104) 93.827%)" }} data-name="Button">
      <Icon1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[23.996px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9963 23.9963">
        <g id="Icon">
          <path d={svgPaths.p3797b740} id="Vector" stroke="var(--stroke-0, #9C8B75)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
          <path d={svgPaths.p382da180} id="Vector_2" stroke="var(--stroke-0, #9C8B75)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99969" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[13.325px] relative shrink-0 w-[34.13px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[13.333px] left-[17px] not-italic text-[#9c8b75] text-[10px] text-center top-0 tracking-[0.5px] whitespace-nowrap">profile</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-center left-[285.66px] opacity-40 top-[11.99px]" data-name="Button">
      <Icon2 />
      <Text1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[77.308px] max-w-[384px] relative shrink-0 w-[383.997px]" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function ContainerMargin() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function Layout3() {
  return (
    <div className="absolute bg-[rgba(248,244,238,0.92)] left-0 top-[774.78px] w-[392.72px]" data-name="Layout">
      <div aria-hidden className="absolute border-[rgba(180,160,130,0.2)] border-solid border-t-[0.717px] inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[0.717px] relative size-full">
        <ContainerMargin />
      </div>
    </div>
  );
}

export default function BloomAppVersionOne() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Bloom App Version One">
      <Layout />
      <Layout1 />
      <Layout2 />
      <Layout3 />
    </div>
  );
}