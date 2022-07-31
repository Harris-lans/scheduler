import { useParams } from "react-router-dom";
import { useSyncState } from "../../components/SyncProvider";

function CollaborativeScheduler() {
    const { roomId } = useParams();

    const [name, setName] = useSyncState(roomId, 'name');

    const onSubmit = ev => {
        ev.preventDefault();
        if (setName) {
            setName(ev.target.name.value);
        }
        ev.target.name.value = '';
    };

    return (
        <>
            <form onSubmit={onSubmit}>
                Your name:
                <br />
                <input type="text" name="name" size={10} />
                &nbsp;
                <input type="submit" value="Update" />
            </form>
            <p> Your name is: <b>{(name as any)}</b></p>
        </>
    );
}

export default CollaborativeScheduler;