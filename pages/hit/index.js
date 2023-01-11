import React, { useEffect, useState } from "react";
import InnerHTML from "dangerously-set-html-content";
import Link from "next/link";

function HitTest() {
  const [htmlFileString, setHtmlFileString] = useState("loading...");
  useEffect(() => {
    (async function () {
      const data = await await (await fetch("/index.html")).text();
      setHtmlFileString(data);
    })();
  }, []);
  return (
    <>
      <Link href={"/"} style={{ fontSize: "2rem", color: "#000" }}>
        home
      </Link>
      <InnerHTML html={htmlFileString} />;
    </>
  );
}

export default HitTest;
