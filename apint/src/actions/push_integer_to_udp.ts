import { action, SendToPluginEvent,KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent, KeyAction } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";


/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "be.elab.apint.pushintudp" })
export class PushIntegerThroughUDP extends SingletonAction<PushIntUDPSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
	 * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
	 * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
	 */
    override onWillAppear(ev: WillAppearEvent<PushIntUDPSettings>): void | Promise<void> {
       return  ev.action.setTitle(this.refreshTitle(ev.payload.settings));
    }

    public refreshTitle(settings : PushIntUDPSettings): string {
        let text = "";

        if (settings.useIntegerIndex) {
            text=`I ${settings.integerIndex ?? 0}\n` +
            `D ${settings.integerValueDown ?? 0}\n` +
            `R ${settings.integerValueUp ?? 0}\n` +
            `IP ${settings.ipAddress ?? ''}\n` +
            `P ${settings.ipPort ?? ''}`;
        } else  {
            text= `D ${settings.integerValueDown ?? 0}\n` +
            `R ${settings.integerValueUp ?? 0}\n` +
            `IP ${settings.ipAddress ?? ''}\n` +
            `P ${settings.ipPort ?? ''}`;
        }
    
     return text;
}

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
	 * settings using `setSettings` and `getSettings`.
	 */
	override async onKeyDown(ev: KeyDownEvent<PushIntUDPSettings>): Promise<void> {


        ev.action.setTitle(this.refreshTitle(ev.payload.settings));
        // Prepare the UDP message
        const udpMessage = Buffer.alloc(8);
        udpMessage.writeInt32LE(ev.payload.settings.integerIndex ?? 0, 0); // Write the index as a signed 32-bit integer in little-endian format
        udpMessage.writeInt32LE(ev.payload.settings.integerValueDown ?? 0, 4); // Write the value as a signed 32-bit integer in little-endian format

        // Send the UDP message without waiting for connection or answer
        const dgram = await import("dgram");
        const client = dgram.createSocket("udp4");
        const ipAddress = ev.payload.settings.ipAddress ?? "127.0.0.1";
        const ipPort = parseInt(ev.payload.settings.ipPort ?? "3615", 10);

        client.send(udpMessage, ipPort, ipAddress, () => {
            client.unref(); // Allow the program to exit without waiting for the socket to close
        });

       // streamDeck.system.openUrl("https://eloistree.github.io/SignMetaMaskTextHere/index.html?q=guid_to_sign");
 
	} 
   

    
	override async onKeyUp(ev: KeyUpEvent<PushIntUDPSettings>): Promise<void> {

	
        ev.action.setTitle(this.refreshTitle(ev.payload.settings));
        // Prepare the UDP message
        const udpMessage = Buffer.alloc(8);
        udpMessage.writeInt32LE(ev.payload.settings.integerIndex ?? 0, 0); // Write the index as a signed 32-bit integer in little-endian format
        udpMessage.writeInt32LE(ev.payload.settings.integerValueUp ?? 0, 4); // Write the value as a signed 32-bit integer in little-endian format

        // Send the UDP message
        const dgram = await import("dgram");
        const client = dgram.createSocket("udp4");
        const ipAddress = ev.payload.settings.ipAddress ?? "127.0.0.1";
        const ipPort = parseInt(ev.payload.settings.ipPort ?? "3615", 10);

        client.send(udpMessage, ipPort, ipAddress, (err) => {
            if (err) {
            console.error("Failed to send UDP message:", err);
            ev.action.setTitle("Error");
            } else {
           // ev.action.showOk();
            }
            client.close();
        });

       // streamDeck.system.openUrl("https://eloistree.github.io/SignMetaMaskTextHere/index.html?q=guid_to_sign");
 
	} 
}

/**
 * Settings for {@link PushIntegerThroughUDP}.
 */
type PushIntUDPSettings = {
    integerIndex?: number;
    integerValueDown?: number;
    integerValueUp?: number;
    useIntegerIndex?: boolean;
    ipAddress?: string;
    ipPort?:string;

};
