import svgPaths from "./svg-7lm7fyogbt";
import imgContainer from "./07d24c3c5d85743059485b9edbb13116818785d1.png";
import imgImageFlower from "./72d045a7dfd8d93f1b462f0ab3e7b6222798b6aa.png";
import imgImageFlower1 from "./fda4ebdd09cea197d94d7c5ce76a772096ee288d.png";

function ImageFlower() {
  return (
    <div className="h-[77px] relative shrink-0 w-full" data-name="Image (flower)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageFlower} />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute flex h-[14.336px] items-center justify-center left-[27.13px] top-[54.05px] w-[32.342px]">
          <div className="flex-none rotate-16">
            <div className="h-[5.738px] relative w-[32px]">
              <div className="absolute inset-[-8.71%_-0.32%_-6.62%_-1.02%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32.4278 6.61766">
                  <path d={svgPaths.p2b5d5480} id="Vector 1" stroke="var(--stroke-0, #9C8B75)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#faf7f0] relative rounded-[16px] shrink-0 size-[77px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ImageFlower />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="Button">
      <Container1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[852.804px] left-0 top-0 w-[392.72px]" data-name="Container">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[35.18%] left-0 max-w-none top-0 w-[76.39%]" src={imgContainer} />
      </div>
      <div className="absolute flex items-center justify-center left-[70px] size-[95.241px] top-[472px]">
        <div className="-rotate-16 flex-none">
          <Button />
        </div>
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

function Container4() {
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

function Container5() {
  return (
    <div className="bg-[rgba(255,252,247,0.82)] relative rounded-[24046500px] shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[0.717px] border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[24046500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12.717px] py-[6.717px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-[95.877px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[6px] items-start relative size-full">
        <Container4 />
        <Container5 />
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

function Container6() {
  return (
    <div className="bg-[rgba(255,252,247,0.82)] relative rounded-[24046500px] shrink-0" data-name="Container">
      <div aria-hidden className="absolute border-[0.717px] border-[rgba(180,160,130,0.2)] border-solid inset-0 pointer-events-none rounded-[24046500px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[12.717px] py-[6.717px] relative size-full">
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-0 pt-[48px] px-[20px] top-0 w-[392.72px]" data-name="Container">
      <Container3 />
      <Container6 />
    </div>
  );
}

function ImageFlower1() {
  return (
    <div className="h-[77px] relative shrink-0 w-full" data-name="Image (flower)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-contain pointer-events-none size-full" src={imgImageFlower} />
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[#faf7f0] relative rounded-[16px] shrink-0 size-[77px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ImageFlower1 />
      </div>
    </div>
  );
}

function ImageFlower2() {
  return (
    <div className="blur-[1px] h-[33.872px] opacity-20 relative w-[41.823px]" data-name="Image (flower)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none object-bottom pointer-events-none size-full" src={imgImageFlower1} />
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex flex-col items-start relative" data-name="Button">
      <Container7 />
      <div className="absolute flex h-[52.26px] items-center justify-center left-[35.85px] top-[37.13px] w-[48.447px]">
        <div className="flex-none rotate-[115.18deg]">
          <ImageFlower2 />
        </div>
      </div>
    </div>
  );
}

export default function Garden() {
  return (
    <div className="bg-[#faf7f0] relative size-full" data-name="Garden">
      <Container />
      <Container2 />
      <div className="absolute flex items-center justify-center left-[214.87px] size-[95.241px] top-[431.87px]">
        <div className="-rotate-16 flex-none">
          <Button1 />
        </div>
      </div>
    </div>
  );
}