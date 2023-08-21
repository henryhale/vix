import "./style.css";

import XTerminal from "xterminal";
import ViteShell from "viteshell";
import { red, green, cyan, gray, italic, dim } from "inken";

// create a shell
const vsh = new ViteShell();

// create the terminal interface
const term = new XTerminal();

// connect the shell to the terminal
vsh.onoutput = (data: string | number) => term.write(data);
vsh.onerror = (reason: string) => term.write(red(reason).toString());
vsh.onclear = term.clear.bind(term);
vsh.onexit = term.dispose.bind(term);

// pass user input to the shell
term.on("data", async (line: unknown) => {
    await vsh.execute(line as string);
});

// abort execution on CTRL+C
term.on("keypress", (ev: unknown) => {
    const evt = ev as KeyboardEvent;
    if (evt.ctrlKey && evt.key === "c") {
        evt.preventDefault();
        vsh.abort();
    }
});

// Configure shell
// prompt style
vsh.env["PS1"] = `\n${red("┌[")}${green("$USERNAME")}@${cyan("$HOSTNAME")}${red("]\n└$")} `;

// alias
vsh.alias["print"] = "echo";

// add a custom command
vsh.addCommand("login", {
    synopsis: "login",
    description: "Demo login process",
    async action({ env, stdin, stdout }) {
        stdout.write("Username: ");
        const username = await stdin.readline();
        stdout.write("Token: ");
        const token = await stdin.readline();
        stdout.write("Logging in as " + cyan(username) + "\n");
        env["USERNAME"] = username;
        env["TOKEN"] = token;
    },
});

// greeting message
function greetUser() {
    return `<div class="greeting">
<img src="xterminal.png" width="45" />

${green(`WELCOME TO THE COMMAND LINE INTERFACE`)}

${dim(italic("powered by")+"")}

${gray(`<a href="https://github.com/henryhale/viteshell">ViteShell</a> ~ <a href="https://github.com/henryhale/inken">Inken</a> ~ <a href="https://github.com/henryhale/xterminal">XTerminal</a>`)}
</div>`;
}

// re-write the greeting on clear
term.on("clear", () => term.write(greetUser()));

// setup the terminal
term.mount("#app");

// let's go
vsh.init();