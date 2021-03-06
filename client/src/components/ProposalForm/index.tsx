import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useWeb3React } from '@web3-react/core'
import { proposal, proposalActions } from '../../store/Proposal/slice'
import { useContractProposal } from '../../hooks/useContract'
import { useState } from 'react'
import { notificationActions } from '../../store/Notification/slice'
import { NOTIFICATION_TYPE, PROPOSAL_WORKFLOW_STATUS } from '../../constants'
import { serializeUSDCFor } from '../../utils/serializeValue'

const ProposalForm = ({ id, address }: { id: number; address: string }) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const proposalContract = useContractProposal(address)
  const proposal = useAppSelector((state) => state.proposal)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [proposalAmount, setProposalAmount] = useState(0)

  const proposalSubmitHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValid = proposalValidationHandler()
    if (isValid) {
      createProposal()
    }
  }

  const handleCancel = () => {
    dispatch(proposalActions.cancelProposal({ id }))
  }

  const createProposal = () => {
    if (proposalContract) {
      proposalContract?.methods
        ?.createProposal(proposalTitle, proposalDescription, serializeUSDCFor(proposalAmount, true))
        .send({ from: account })
        .then((response: any) => {
          const proposalId = response.events.proposalCreated.returnValues.proposalId
          const proposal: proposal = {
            id: parseInt(proposalId),
            title: proposalTitle,
            description: proposalDescription,
            amount: proposalAmount,
            okVotes: 0,
            nokVotes: 0,
            status: PROPOSAL_WORKFLOW_STATUS.Registered,
            deadLine: new Date().setDate(new Date().getDate() + 7),
            accepted: false,
            onChain: true,
          }

          dispatch(proposalActions.createProposal({ active: proposal, id }))
          dispatch(
            notificationActions.setNotification({
              message: `Proposal ${proposalTitle} has been correctly added`,
              type: NOTIFICATION_TYPE.SUCCESS,
            })
          )
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  const proposalValidationHandler = () => {
    if (account) {
      if (proposalTitle === '') {
        dispatch(
          notificationActions.setNotification({
            message: 'Please enter a title for your proposal!',
            type: NOTIFICATION_TYPE.ALERT,
          })
        )
      } else if (proposalDescription === '') {
        dispatch(
          notificationActions.setNotification({
            message: 'Please enter a description for your proposal!',
            type: NOTIFICATION_TYPE.ALERT,
          })
        )
      } else if (!(proposalAmount > 0)) {
        dispatch(
          notificationActions.setNotification({
            message: 'Please enter an amount greater than 0!',
            type: NOTIFICATION_TYPE.ALERT,
          })
        )
      } else if (proposalAmount > proposal.availableFunds) {
        dispatch(
          notificationActions.setNotification({
            message: 'Not enough found available in your campaign',
            type: NOTIFICATION_TYPE.ALERT,
          })
        )
      } else {
        return true
      }
      return false
    }
  }

  return (
    <div className="card mb-3 mt-3">
      <form onSubmit={proposalSubmitHandle}>
        <div className="card-body">
          <div className="mb-3 mt-3">
            <label htmlFor="proposalTitle" className="form-label">
              Proposal Title
            </label>
            <input
              type="text"
              className="form-control"
              id="proposalTitle"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
            />
          </div>
          <div className="mb-3 mt-3">
            <label className="form-label" htmlFor="proposalDescription">
              Describe your proposal
            </label>
            <textarea
              className="form-control"
              placeholder="Describe your proposal here"
              id="proposalDescription"
              style={{ height: '100px' }}
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
            />
          </div>
          <div className="mb-3 mt-3">
            <label htmlFor="proposalAmount" className="form-label">
              How much do you want to withdraw(USDC)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              id="proposalAmount"
              value={proposalAmount}
              onChange={(e) => setProposalAmount(parseFloat(e.target.value))}
            />
          </div>
          <div className="list-inline">
            <div className="list-inline-item">
              <button type="submit" className="btn btn-primary">
                Validate and create
              </button>
            </div>
            <div className="list-inline-item">
              <button type="button" className="btn btn-secondary" onClick={() => handleCancel()}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProposalForm
