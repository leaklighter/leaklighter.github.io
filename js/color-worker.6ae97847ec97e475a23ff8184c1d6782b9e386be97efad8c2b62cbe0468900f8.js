var a=null,n="";async function d(e){return a&&n===e||(n=e,a=(async()=>{let r=await(await import(`${e}pyodide/pyodide.mjs`)).loadPyodide({indexURL:`${e}pyodide/`});await r.loadPackage(`${e}wheels/regex-2024.11.6-cp313-cp313-pyodide_2025_0_wasm32.whl`),await r.loadPackage(`${e}wheels/parsimonious-0.10.0-py3-none-any.whl`),r.FS.mkdirTree("/home/pyodide/trace_tools");for(let s of["__init__.py","grammar.py","grammar_color.py","grammar_probe.py"]){let t=await fetch(`${e}python/${s}`,{cache:"no-cache"});if(!t.ok)throw new Error(`missing local Python module ${s}`);r.FS.writeFile(`/home/pyodide/trace_tools/${s}`,await t.text())}return await r.runPythonAsync(`
import json
from pathlib import Path
from parsimonious.exceptions import ParseError
from trace_tools.grammar import load_grammar
from trace_tools.grammar_color import attribute, runs, summarize

def color_many(grammar_source, byte_values, reports_json):
    path = Path("/tmp/current.peg")
    path.write_text(grammar_source)
    grammar = load_grammar(path)
    doc = bytes(byte_values).decode("latin-1")
    results = []
    try:
        tree = grammar.parse(doc)
    except ParseError as error:
        return json.dumps({"error": str(error)})
    for report in json.loads(reports_json):
        verdict_at = attribute(doc, grammar, report, tree)
        results.append({
            "runs": [{"start": start, "end": end, "verdict": verdict, "kind": kind}
                     for start, end, verdict, kind in runs(verdict_at)],
            "counts": summarize(verdict_at)["counts"],
        })
    return json.dumps({"results": results}, separators=(",", ":"))
`),r})()),a}self.onmessage=async e=>{let o=e.data;try{let r=await d(o.runtimeBase);r.globals.set("grammar_source_js",o.grammarSource),r.globals.set("byte_values_js",new Uint8Array(o.bytes)),r.globals.set("reports_json_js",JSON.stringify(o.reports));let s=String(await r.runPythonAsync("color_many(grammar_source_js, byte_values_js, reports_json_js)")),t=JSON.parse(s),i=t.error?{type:"error",id:o.id,message:t.error}:{type:"result",id:o.id,results:t.results??[]};self.postMessage(i)}catch(r){let s={type:"error",id:o.id,message:r instanceof Error?r.message:String(r)};self.postMessage(s)}};
