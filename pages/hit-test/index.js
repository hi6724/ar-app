import React, { useEffect, useState } from "react";
import InnerHTML from "dangerously-set-html-content";

function HitTest() {
  const [htmlFileString, setHtmlFileString] = useState("loading...");
  useEffect(() => {
    (async function () {
      const data = await await (await fetch("/index.html")).text();
      setHtmlFileString(data);
    })();
  }, []);
  return <InnerHTML html={htmlFileString} />;
}

export default HitTest;
